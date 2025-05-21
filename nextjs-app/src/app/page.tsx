import Image from "next/image";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Welcome to Music Database</h1>
        <p className="text-gray-500 mt-2">Explore our collection of music</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <a
          href="/artists"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">Artists</h2>
          <p className="text-gray-500">Browse our collection of artists and their albums</p>
        </a>
        
        <a
          href="/albums"
          className="block p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-500 transition-colors"
        >
          <h2 className="text-2xl font-semibold mb-2">Albums</h2>
          <p className="text-gray-500">Explore albums and their tracks</p>
        </a>
      </div>
    </div>
  );
}
