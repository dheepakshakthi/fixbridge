import Link from "next/link"
import { ShieldAlert } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default function UnauthorisedPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-red-100 rounded-full">
            <ShieldAlert className="w-12 h-12 text-red-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You do not have the necessary permissions to access this page. If you believe this is an error, please contact support.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="outline" className="w-full sm:w-auto">
              Go Home
            </Button>
          </Link>
          <Link href="/login">
            <Button className="w-full sm:w-auto">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
