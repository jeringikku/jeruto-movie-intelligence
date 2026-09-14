import MovieHeader from "@/components/movies/MovieHeader";
import MovieSearch from "@/components/movies/MovieSearch";
import MovieTable from "@/components/movies/MovieTable";

export default function MoviesPage() {
  return (
    <div className="space-y-8">
      <MovieHeader />

      <MovieSearch />

      <MovieTable />
    </div>
  );
}