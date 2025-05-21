import { notFound } from 'next/navigation';
import { Artist, Album } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

async function getArtist(id: string) {
  const res = await fetch(`http://localhost:3000/api/artists?id=${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch artist');
  }
  
  const data = await res.json();
  return data.data as Artist;
}

async function getArtistAlbums(artistId: string) {
  const res = await fetch(`http://localhost:3000/api/albums?artistId=${artistId}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch albums');
  }
  
  const data = await res.json();
  return data.data.items as Album[];
}

export default async function ArtistPage({
  params,
}: {
  params: { id: string };
}) {
  const [artist, albums] = await Promise.all([
    getArtist(params.id),
    getArtistAlbums(params.id),
  ]);

  if (!artist) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{artist.Name}</h1>
        <p className="text-gray-500">Artist details and albums</p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Albums</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <Card key={album.AlbumId}>
              <CardHeader>
                <CardTitle>{album.Title}</CardTitle>
              </CardHeader>
              <CardContent>
                <a
                  href={`/albums/${album.AlbumId}`}
                  className="text-blue-600 hover:underline"
                >
                  View details →
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
