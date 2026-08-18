"use client";

import { useActionState, useState } from "react";
import { login, signup } from "@/app/actions/auth";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loginState, loginAction, loginPending] = useActionState(login, undefined);
  const [signupState, signupAction, signupPending] = useActionState(signup, undefined);

  return (
    <div className="flex min-h-full flex-1 items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        <h1 className="mb-1 text-center text-2xl font-bold">floandhome</h1>
        <p className="mb-8 text-center text-sm text-gray-500">재고 · 매출 관리</p>

        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "login" ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            로그인
          </button>
          <button
            type="button"
            onClick={() => setMode("signup")}
            className={`flex-1 rounded-md py-2 text-sm font-medium transition ${
              mode === "signup" ? "bg-white shadow" : "text-gray-500"
            }`}
          >
            회원가입
          </button>
        </div>

        {mode === "login" ? (
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">이메일</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">비밀번호</label>
              <input
                name="password"
                type="password"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              />
            </div>
            {loginState?.error && (
              <p className="text-sm text-red-600">{loginState.error}</p>
            )}
            <button
              type="submit"
              disabled={loginPending}
              className="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {loginPending ? "로그인 중..." : "로그인"}
            </button>
          </form>
        ) : (
          <form action={signupAction} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">이름</label>
              <input
                name="name"
                type="text"
                required
                placeholder="예: 김사장"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">역할</label>
              <select
                name="role"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              >
                <option value="staff">알바</option>
                <option value="owner">사장</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">이메일</label>
              <input
                name="email"
                type="email"
                required
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">비밀번호</label>
              <input
                name="password"
                type="password"
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-base"
              />
            </div>
            {signupState?.error && (
              <p className="text-sm text-red-600">{signupState.error}</p>
            )}
            <button
              type="submit"
              disabled={signupPending}
              className="w-full rounded-lg bg-gray-900 py-2.5 font-medium text-white disabled:opacity-50"
            >
              {signupPending ? "가입 중..." : "회원가입"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
