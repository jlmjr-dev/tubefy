import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AudioLines, MonitorPlay } from "lucide-react";

export function Login() {
    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Login with both platforms</CardTitle>
                <CardDescription>
                    We need you to login to both platforms in order to use the app. You must login with your Spotify and Youtube account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Button className="w-full mb-4">
                    <AudioLines /> Login with Spotify
                </Button>
                <Button className="w-full">
                    <MonitorPlay /> Login with Youtube
                </Button>
            </CardContent>
        </Card>
    )
}
