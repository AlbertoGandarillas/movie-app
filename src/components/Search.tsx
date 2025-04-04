export default function Search({ searchTerm, setSearchTerm }: { searchTerm: string, setSearchTerm: (searchTerm: string) => void }) {
  return (
    <div className="search">
      <div>
        <img src="/search.svg" alt="Search" />
        <input type="text" placeholder="Search for movies..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>
    </div>
  )
}
