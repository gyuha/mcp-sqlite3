import { notFound } from 'next/navigation';
import { Album, Artist, Track } from '@/types/database';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

async function getAlbum(id: string) {
  const res = await fetch(`http://localhost:3000/api/albums?id=${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error('Failed to fetch album');
  }
  
  const data = await res.json();
  return data.data as Album;
}

async function getArtist(id: string) {
  const res = await fetch(`http://localhost:3000/api/artists?id=${id}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch artist');
  }
  
  const data = await res.json();
  return data.data as Artist;
}

async function getAlbumTracks(albumId: string) {
  const res = await fetch(`http://localhost:3000/api/tracks?albumId=${albumId}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch tracks');
  }
  
  const data = await res.json();
  return data.data as Track[];
}

export default async function AlbumPage({
  params,
}: {
  params: { id: string };
}) {
  const album = await getAlbum(params.id);

  if (!album) {
    notFound();
  }

  const [artist, tracks] = await Promise.all([
    getArtist(album.ArtistId.toString()),
    getAlbumTracks(params.id),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{album.Title}</h1>
        <p className="text-gray-500">
          <a href={`/artists/${artist.ArtistId}`} className="text-blue-600 hover:underline">
            {artist.Name}
          </a>
        </p>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">Tracks</h2>
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <Card key={track.TrackId}>
              <CardHeader>
                <CardTitle>
                  <span className="text-gray-500">{index + 1}.</span> {track.Name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-gray-500">
                  {track.Composer && <p>Composer: {track.Composer}</p>}
                  <p>Duration: {Math.round(track.Milliseconds / 1000)}s</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
