create schema if not exists app_core;
create schema if not exists rag_core;
create schema if not exists legal_corpus;
create schema if not exists admin_audit;

create table if not exists app_core.users (
  id bigserial primary key,
  username varchar(80) unique not null,
  password_hash varchar(255) not null,
  role varchar(20) not null default 'user',
  is_active boolean not null default true,
  failed_login_count integer not null default 0,
  locked_until timestamptz,
  force_password_change boolean not null default false,
  last_login_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists app_core.access_requests (
  id bigserial primary key,
  full_name varchar(160) not null,
  email varchar(255) not null,
  organization varchar(255),
  use_case text,
  status varchar(20) not null default 'pending',
  reviewed_by_user_id bigint references app_core.users(id),
  reviewed_at timestamptz,
  decision_notes text,
  issued_username varchar(80),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_core.auth_audit_logs (
  id bigserial primary key,
  user_id bigint references app_core.users(id),
  event_type varchar(60) not null,
  ip_address varchar(64),
  user_agent text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists app_core.password_reset_tokens (
  id bigserial primary key,
  user_id bigint not null references app_core.users(id),
  token_hash varchar(128) not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists app_core.auth_sessions (
  id bigserial primary key,
  user_id bigint not null references app_core.users(id),
  token_hash text not null,
  ip_address text,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists app_core.documents (
  id bigserial primary key,
  user_id bigint not null references app_core.users(id),
  original_name text not null,
  storage_path text not null,
  mime_type varchar(120) not null,
  file_size bigint not null,
  sha256 varchar(64) unique not null,
  status varchar(20) not null default 'uploaded',
  created_at timestamptz not null default now()
);

create table if not exists app_core.chats (
  id bigserial primary key,
  user_id bigint not null references app_core.users(id),
  title text,
  created_at timestamptz not null default now()
);

create table if not exists app_core.chat_messages (
  id bigserial primary key,
  chat_id bigint not null references app_core.chats(id),
  role varchar(20) not null,
  content text not null,
  citations jsonb,
  created_at timestamptz not null default now()
);

create table if not exists rag_core.document_chunks (
  id bigserial primary key,
  document_id bigint not null references app_core.documents(id),
  chunk_index integer not null,
  chunk_text text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists rag_core.embeddings (
  id bigserial primary key,
  chunk_id bigint not null references rag_core.document_chunks(id) on delete cascade,
  embedding_model varchar(120) not null,
  embedding double precision[] not null,
  created_at timestamptz not null default now()
);

create table if not exists rag_core.retrieval_logs (
  id bigserial primary key,
  user_id bigint,
  query_text text not null,
  top_k integer not null,
  retrieved_chunk_ids jsonb not null,
  scores jsonb,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists rag_core.model_runs (
  id bigserial primary key,
  user_id bigint,
  model_name varchar(120) not null,
  task_type varchar(40) not null,
  token_in integer,
  token_out integer,
  latency_ms integer,
  created_at timestamptz not null default now()
);

create table if not exists rag_core.guardrail_events (
  id bigserial primary key,
  user_id bigint,
  event_type varchar(40) not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists legal_corpus.legal_sources (
  id bigserial primary key,
  source_name text not null,
  source_url text not null,
  authority_type varchar(40) not null,
  jurisdiction varchar(100),
  created_at timestamptz not null default now()
);

create table if not exists legal_corpus.legal_documents (
  id bigserial primary key,
  source_id bigint references legal_corpus.legal_sources(id),
  doc_type varchar(40) not null,
  title text not null,
  act_or_case_no text,
  jurisdiction varchar(100),
  publication_date date,
  effective_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists legal_corpus.legal_sections (
  id bigserial primary key,
  legal_document_id bigint not null references legal_corpus.legal_documents(id),
  section_no text,
  heading text,
  body text not null,
  version_no integer not null default 1,
  is_current boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists legal_corpus.legal_amendments (
  id bigserial primary key,
  legal_document_id bigint not null references legal_corpus.legal_documents(id),
  amendment_title text,
  effective_date date,
  summary text,
  created_at timestamptz not null default now()
);

create table if not exists legal_corpus.land_property_topics (
  id bigserial primary key,
  topic_name varchar(120) unique not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists legal_corpus.legal_doc_topic_map (
  id bigserial primary key,
  legal_document_id bigint not null references legal_corpus.legal_documents(id),
  topic_id bigint not null references legal_corpus.land_property_topics(id),
  created_at timestamptz not null default now(),
  unique(legal_document_id, topic_id)
);

create table if not exists legal_corpus.citation_graph (
  id bigserial primary key,
  from_document_id bigint not null references legal_corpus.legal_documents(id),
  to_document_id bigint not null references legal_corpus.legal_documents(id),
  relation_type varchar(40) not null,
  note text,
  created_at timestamptz not null default now()
);

create table if not exists admin_audit.admin_actions (
  id bigserial primary key,
  actor_user_id bigint,
  action_type varchar(60) not null,
  payload jsonb,
  created_at timestamptz not null default now()
);
