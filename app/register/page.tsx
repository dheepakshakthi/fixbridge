"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { UserPlus, User, Store } from "lucide-react";

import { Button } from "@/components/ui/Button";
import {
  registerCustomerSchema,
  registerProviderSchema,
  type RegisterCustomerInput,
  type RegisterProviderInput,
} from "@/schemas/auth";
import { createClient } from "@/utils/supabase/client";

type RegisterType = "customer" | "provider";

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [registerType, setRegisterType] = useState<RegisterType | null>(null);
  const supabase = createClient();

  const customerForm = useForm<RegisterCustomerInput>({
    resolver: zodResolver(registerCustomerSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const providerForm = useForm<RegisterProviderInput>({
    resolver: zodResolver(registerProviderSchema),
    defaultValues: {
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
    },
  });

  const onCustomerSubmit = async (data: RegisterCustomerInput) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            user_role: "customer",
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        toast.success("Account created successfully!");
        router.push("/customer/dashboard");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onProviderSubmit = async (data: RegisterProviderInput) => {
    setIsLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            user_role: "provider",
          },
        },
      });

      if (authError) {
        toast.error(authError.message);
        return;
      }

      if (authData.user) {
        toast.success("Account created! Please complete your shop profile.");
        // Redirect to provider onboarding (assumed route based on plan)
        router.push("/provider/onboarding");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!registerType) {
    return (
      <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="flex justify-center">
            <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Join FixBridge
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Choose how you want to use the platform
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={() => setRegisterType("customer")}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-10 shadow-sm flex flex-col items-center space-y-4 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
            >
              <div className="p-3 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                <User className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  I need a repair
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Find verified shops and track your repairs
                </p>
              </div>
            </button>

            <button
              onClick={() => setRegisterType("provider")}
              className="relative rounded-lg border border-gray-300 bg-white px-6 py-10 shadow-sm flex flex-col items-center space-y-4 hover:border-indigo-500 hover:ring-1 hover:ring-indigo-500 transition-all group"
            >
              <div className="p-3 bg-indigo-50 rounded-full group-hover:bg-indigo-100 transition-colors">
                <Store className="w-8 h-8 text-indigo-600" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-gray-900">
                  I run a repair shop
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Grow your business and manage jobs efficiently
                </p>
              </div>
            </button>
          </div>
          <p className="mt-8 text-center text-sm text-gray-600">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = registerType === "customer" ? customerForm : providerForm;
  const onSubmit =
    registerType === "customer" ? onCustomerSubmit : onProviderSubmit;

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <button
            onClick={() => setRegisterType(null)}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-500 mb-4 flex items-center"
          >
            &larr; Back to selection
          </button>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-gray-900">
          {registerType === "customer"
            ? "Create Customer Account"
            : "Register Your Shop"}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit as any)}>
            <div>
              <label
                htmlFor="full_name"
                className="block text-sm font-medium text-gray-700"
              >
                Full Name
              </label>
              <div className="mt-1">
                <input
                  {...register("full_name")}
                  id="full_name"
                  type="text"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.full_name ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.full_name && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.full_name.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email address
              </label>
              <div className="mt-1">
                <input
                  {...register("email")}
                  id="email"
                  type="email"
                  autoComplete="email"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.email ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.email.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="mt-1">
                <input
                  {...register("password")}
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.password ? "border-red-300" : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.password.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm_password"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm Password
              </label>
              <div className="mt-1">
                <input
                  {...register("confirm_password")}
                  id="confirm_password"
                  type="password"
                  autoComplete="new-password"
                  className={`appearance-none block w-full px-3 py-2 border ${
                    errors.confirm_password
                      ? "border-red-300"
                      : "border-gray-300"
                  } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                />
                {errors.confirm_password && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.confirm_password.message as string}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full" loading={isLoading}>
                {registerType === "customer"
                  ? "Create Account"
                  : "Register Shop"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
