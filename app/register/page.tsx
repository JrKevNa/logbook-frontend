import { Card } from "flowbite-react";
import RegisterForm from "./RegisterForm";

export default function Register() {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <Card className="max-w-sm w-full p-6">
                <h5 className="text-2xl font-bold tracking-tight text-center">
                    Register
                </h5>
                {/* <p className="font-normal text-gray-700 dark:text-gray-400 text-center mt-2">
                    Here are the biggest enterprise technology acquisitions of 2021 so far, in reverse chronological order.
                </p> */}
                <RegisterForm/>
            </Card>
        </div>
    )
}