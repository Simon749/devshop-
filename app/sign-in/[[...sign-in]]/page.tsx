import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-tight">DevCraft</h1>
          <p className="text-slate-400 text-sm mt-1">Admin access only</p>
        </div>
        {/* 
          Clerk's <SignIn> component handles the full auth flow.
          The `redirect_url` param from middleware is automatically
          picked up — after sign-in Clerk redirects back to /admin.
        */}
        <SignIn
          appearance={{
            elements: {
              rootBox: "shadow-2xl",
              card: "bg-slate-900 border border-slate-800",
              headerTitle: "text-white",
              headerSubtitle: "text-slate-400",
              socialButtonsBlockButton: "border-slate-700 text-slate-300 hover:bg-slate-800",
              formFieldLabel: "text-slate-300",
              formFieldInput: "bg-slate-800 border-slate-700 text-white",
              footerActionLink: "text-indigo-400 hover:text-indigo-300",
              formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500",
            },
          }}
        />
      </div>
    </main>
  );
}