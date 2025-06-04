import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "kaaafika Dashboard",
  description: "Unlock Financial Opportunities with kaaafika",
};

export default function SignIn() {
  return <SignInForm />;
}
