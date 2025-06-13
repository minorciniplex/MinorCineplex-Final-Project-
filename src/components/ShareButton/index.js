import { useRouter } from "next/router"


export default function ShareButton() {
    const router = useRouter();
    return (
        <div>
            <button onClick={() => router.push('/share-page')}>Share</button>
        </div>
    )
}