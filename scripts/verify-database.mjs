import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PGlite } from '@electric-sql/pglite';

// Real PostgreSQL execution, entirely in memory; no network or live credentials.
const db = new PGlite();
const sql = async name => readFile(new URL(`../database/${name}`, import.meta.url), 'utf8');
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; console.log(`PASS ${message}`); };
const scalar = async query => Object.values((await db.query(query)).rows[0])[0];
const alice = '00000000-0000-0000-0000-000000000001';
const bob = '00000000-0000-0000-0000-000000000002';
const mentor = '00000000-0000-0000-0000-000000000003';
async function as(id, query) {
  await db.exec('begin; set local role authenticated;');
  try {
    await db.query("select set_config('request.jwt.claim.sub',$1,true), set_config('request.jwt.claims',$2,true)", [id, JSON.stringify({email: `${id.slice(-1)}@example.invalid`})]);
    const result = await db.query(query);
    await db.exec('commit');
    return result.rows;
  } catch (error) { await db.exec('rollback'); throw error; }
}
async function denied(id, query, message) {
  await assert.rejects(() => as(id, query)); check(true, message);
}
try {
  await db.exec(await sql('test-fixture.sql'));
  await db.exec(`insert into auth.users values('${alice}','1@example.invalid'),('${bob}','2@example.invalid'),('${mentor}','3@example.invalid');
    insert into public.users(id,"userName","userEmail","remainingCredits") values(1,'Alice','1@example.invalid',30),(2,'Bob','2@example.invalid',0);
    insert into public.mentors(id,full_name,email,availability) values(1,'Mentor','3@example.invalid',true);
    insert into public.job_tracker(id,"userId",job_title,description,company) values(1,1,'Existing job','Preserve this row','Example');`);
  const sqlRepair = await sql('schema-repair.sql');
  const oldPolicies = (await db.query('select tablename,policyname,cmd,roles,qual,with_check from pg_policies order by tablename,policyname')).rows;
  await db.exec(`insert into public.users(id,"userName","userEmail") values(9,'Unmatched legacy profile','unmatched@example.invalid')`);
  await assert.rejects(() => db.exec(sqlRepair));
  await db.exec('rollback');
  check(await scalar("select count(*)::int from information_schema.columns where table_name='users' and column_name='auth_uid'") === 0, 'unmatched legacy ownership aborts the whole repair safely');
  await db.exec('delete from public.users where id=9');
  await db.exec("insert into auth.users values('00000000-0000-0000-0000-000000000009','1@example.invalid')");
  await assert.rejects(() => db.exec(sqlRepair));
  await db.exec('rollback');
  check(await scalar("select count(*)::int from information_schema.columns where table_name='users' and column_name='auth_uid'") === 0, 'ambiguous legacy ownership aborts without guessing');
  await db.exec("delete from auth.users where id='00000000-0000-0000-0000-000000000009'");
  await db.exec(await sql('schema-repair.sql'));
  check(await scalar('select count(*)::int from public.job_tracker') === 1, 'repair preserves existing jobs');
  check((await as(alice, 'select id from public.users')).length === 1, 'student sees only own private profile');
  check((await as(bob, 'select * from public.job_tracker')).length === 0, 'other student cannot read private jobs');
  check((await as(bob, `update public.job_tracker set description='stolen' where id=1 returning id`)).length === 0, 'other student cannot edit private jobs');
  await denied(bob, `insert into public.job_tracker("userId",description,company,job_title) values(1,'forged','Example','Role')`, 'cannot create records for another student');
  await denied(alice, 'update public.users set "remainingCredits"=999', 'browser cannot mint credits');
  await denied(alice, 'update public.users set "isPro"=true', 'browser cannot grant paid status');
  const directory = await as(alice, 'select * from public.users_directory');
  check(directory.length === 2 && directory.every(x => x.userEmail === null && !('google_refresh_token' in x)), 'directory exposes safe profiles without contact details or tokens');
  await db.exec("select setval('public.users_id_seq', (select max(id) from public.users), true)");
  const newcomer = '00000000-0000-0000-0000-000000000004';
  await db.exec(`insert into auth.users values('${newcomer}','4@example.invalid')`);
  await as(newcomer, `insert into public.users(auth_uid,"userName","userEmail",avatar,invite_link) values('${newcomer}','New member','4@example.invalid',null,'test-invite') on conflict(auth_uid) do nothing returning id`);
  check((await as(newcomer, 'select * from public.users'))[0].remainingCredits === 0, 'new-account onboarding creates a profile with server credit defaults');
  check((await as(newcomer, `insert into public.users(auth_uid,"userName","userEmail") values('${newcomer}','New member','4@example.invalid') on conflict(auth_uid) do nothing returning id`)).length === 0, 'duplicate onboarding retries preserve the existing profile');
  await as(alice, `insert into public."roadmapUsers"(user_id,roadmap_data) values(1,'{}')`);
  await as(alice, `insert into public.tracks(user_id,roadmap_id) values(1,1)`);
  check((await as(bob, 'select * from public.tracks')).length === 0, 'roadmap progress is private');
  await denied(bob, `insert into public.tracks(user_id,roadmap_id) values(2,1)`, 'cannot attach progress to another account roadmap');
  await as(alice, `insert into public.messages(sender_id,sender_type,receiver_id,receiver_type,content) values(1,'peer',1,'mentor','Hello mentor')`);
  check((await as(mentor, 'select * from public.messages')).length === 1, 'correct mentor receives message despite overlapping numeric IDs');
  check((await as(bob, 'select * from public.messages')).length === 0, 'unrelated account cannot read messages');
  await denied(bob, `insert into public.messages(sender_id,sender_type,receiver_id,receiver_type,content) values(1,'peer',1,'mentor','forged')`, 'message sender cannot be impersonated');
  await denied(alice, `update public.messages set receiver_id=2 where id=1`, 'message participants cannot be rewritten');
  await as(alice, `select * from public.book_mentor_session(1,30,now()+interval '1 day','Discuss career')`);
  check(await scalar('select "remainingCredits" from public.users where id=1') === 10, 'booking deducts the server-controlled cost');
  await denied(alice, `select * from public.book_mentor_session(1,45,now()+interval '1 day','More help')`, 'insufficient balance rejects booking');
  check(await scalar('select count(*)::int from public.mentor_sessions') === 1 && await scalar('select "remainingCredits" from public.users where id=1') === 10, 'failed booking leaves credits and sessions unchanged');
  check((await as(bob, 'select * from public.mentor_sessions')).length === 0, 'session details are participant-only');
  await as(mentor, `update public.mentor_sessions set status='accepted' where id=1`);
  check(await scalar('select status from public.mentor_sessions where id=1') === 'accepted', 'mentor can accept own booking');
  await db.exec(await sql('schema-repair.sql'));
  check(await scalar('select count(*)::int from public.messages') === 1, 'repair safely reruns after new activity');
  await db.exec(await sql('rollback-access.sql'));
  assert.deepEqual((await db.query('select tablename,policyname,cmd,roles,qual,with_check from pg_policies order by tablename,policyname')).rows, oldPolicies);
  check(true, 'access rollback restores all recorded legacy policies');
  check(await scalar('select count(*)::int from public.messages') === 1 && await scalar('select count(*)::int from public.job_tracker') === 1 && await scalar('select count(*)::int from public.mentor_sessions') === 1, 'access rollback preserves existing and newly created records');
  console.log(`${checks} database checks passed. No live database was modified.`);
} catch (error) { console.error('Database check failed:', error.message); process.exitCode = 1; } finally { await db.close(); }
