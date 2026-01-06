import { ChangePasswordForm } from "./ChangePasswordForm";
import { ProfileForm } from "./ProfileForm";

export default function Home() {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Profile</h1> 
            <ProfileForm/>

            {/* <h1 className="text-2xl font-bold mt-4 mb-4">Change Password</h1> 
            <ChangePasswordForm/> */}
        </div>
    )
}