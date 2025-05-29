"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { GoogleIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/authStore";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email" }),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const LogInForm = () => {
  const { logIn, logInWithGoogle, loading } = useAuthStore();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const success = await logIn(values.email, values.password);
    if (success) {
      router.push("/");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await logInWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("Google login error:", error);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="w-full max-w-md shadow-md p-8 rounded-lg flex flex-col gap-5 bg-card/80 backdrop-blur-sm"
      >
        <div className="w-full space-y-5 p-2">
          <h1 className="text-3xl mb-10 font-bold text-center">Log In</h1>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button variant="default" disabled={loading} className="px-10 py-5">
          {!loading ? (
            "Log In"
          ) : (
            <>
              <Loader className=" animate-spin" />
              Logging In...
            </>
          )}
        </Button>

        <div className="flex items-center justify-between">
          <div className="flex-grow border-t border-border"></div>
          <span className="mx-4 text-muted-foreground">OR</span>
          <div className="flex-grow border-t border-border"></div>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="flex items-center justify-center gap-2 py-5"
        >
          <GoogleIcon className="size-5" />
          {loading ? "Logging In..." : "Continue With Google"}
        </Button>

        <div className="text-center">
          <p className="text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </form>
    </Form>
  );
};

export default LogInForm;
