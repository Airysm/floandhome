-- floandhome 재고관리 앱 스키마
-- Supabase 대시보드 > SQL Editor 에서 전체 실행하세요.

create type user_role as enum ('owner', 'staff');
create type transaction_type as enum ('in', 'sale', 'adjust');

-- 사장/알바 프로필 (회원가입 시 자동 생성)
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  role user_role not null default 'staff',
  created_at timestamptz not null default now()
);

-- 상품
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text,
  unit text not null default '개',
  price numeric(12,2) not null default 0,
  stock numeric(12,2) not null default 0,
  min_stock numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

-- 입고/판매/조정 이력. quantity는 재고에 실제로 더해지는 부호 있는 값
-- (입고 +, 판매 -, 조정은 +/- 직접 입력)
create table transactions (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  type transaction_type not null,
  quantity numeric(12,2) not null,
  unit_price numeric(12,2),
  revenue numeric(12,2),
  memo text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

create index transactions_product_id_idx on transactions(product_id);
create index transactions_created_at_idx on transactions(created_at);

-- 회원가입 시 auth.users -> profiles 자동 생성
-- signUp 호출 시 options.data.name / options.data.role 로 값 전달
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'staff')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 트랜잭션 등록 시 상품 재고 자동 반영
create function public.apply_transaction_to_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update products set stock = stock + new.quantity where id = new.product_id;
  return new;
end;
$$;

create trigger on_transaction_created
  after insert on transactions
  for each row execute function public.apply_transaction_to_stock();

-- 현재 로그인 사용자의 role 조회 헬퍼 (RLS 정책에서 사용)
create function public.current_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

-- RLS 활성화
alter table profiles enable row level security;
alter table products enable row level security;
alter table transactions enable row level security;

-- profiles: 본인 정보 조회, 사장은 전체 조회
create policy "profiles_select_own_or_owner"
  on profiles for select
  using (id = auth.uid() or public.current_role() = 'owner');

-- products: 로그인한 누구나 조회, 사장만 추가/수정/삭제
create policy "products_select_authenticated"
  on products for select
  to authenticated
  using (true);

create policy "products_insert_owner"
  on products for insert
  to authenticated
  with check (public.current_role() = 'owner');

create policy "products_update_owner"
  on products for update
  to authenticated
  using (public.current_role() = 'owner');

create policy "products_delete_owner"
  on products for delete
  to authenticated
  using (public.current_role() = 'owner');

-- transactions: 로그인한 누구나 조회/등록 (수정·삭제는 막아서 이력 보존)
create policy "transactions_select_authenticated"
  on transactions for select
  to authenticated
  using (true);

create policy "transactions_insert_authenticated"
  on transactions for insert
  to authenticated
  with check (created_by = auth.uid());
