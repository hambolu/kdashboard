import GridShape from "@/components/common/GridShape";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <ThemeProvider>
        <div className="mx-auto flex min-h-screen max-w-[1440px] items-center justify-center p-5 lg:p-10">
          <div className="w-full max-w-[440px] rounded-2xl bg-white p-8 shadow-[0_0_40px_-10px_rgba(0,0,0,0.1)] dark:bg-gray-800/50 lg:p-12">
            <div className="mb-10 text-center">
              <Link href="/" className="inline-block">
                <Image
                  width={180}
                  height={37}
                  src="/images/logo/main_logo.svg"
                  alt="kaaafika"
                  className="dark:invert"
                  priority
                />
              </Link>
            </div>
            {children}
          </div>
        </div>
      </ThemeProvider>
    </div>
  );
}
