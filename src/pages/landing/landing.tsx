import { Button } from "@/components/ui/button"

export function Landing() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center">
            <h1 className="text-4xl font-bold mb-4">Welcome to Tubefy</h1>
            <h3 className="text-lg mb-8">What are you looking for?</h3>
            <div className="flex gap-4">
                <Button className="mt-2">
                    Watch
                </Button>
                <Button className="mt-2">
                    Create
                </Button>
            </div>
        </div>
    )
}