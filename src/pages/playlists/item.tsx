import {
    Item,
    ItemContent,
    ItemDescription,
    ItemMedia,
    ItemTitle,
} from "@/components/ui/item"

export function PlaylistItem({ song }: { song: any }) {
    return (
        <Item key={song.title} variant="outline" role="listitem" render={<a href="#">
            <ItemMedia variant="image">
                <img
                    src={`https://avatar.vercel.sh/${song.title}`}
                    alt={song.title}
                    width={32}
                    height={32}
                    className="object-cover grayscale"
                />
            </ItemMedia>
            <ItemContent>
                <ItemTitle className="line-clamp-1">
                    {song.title}
                    <span className="text-muted-foreground">{song.album}</span>
                </ItemTitle>
                <ItemDescription>{song.artist}</ItemDescription>
            </ItemContent>
            <ItemContent className="flex-none text-center">
                <ItemDescription>{song.duration}</ItemDescription>
            </ItemContent>
        </a>} />
    )
}