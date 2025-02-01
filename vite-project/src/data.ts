export async function popularPhoto(page: number, search: string) {
    try {
      const res = await fetch(
        `https://api.unsplash.com/search/photos?&query=${search}=&page=${page}&per_page=20&order_by=popular&client_id=PPEjk1ZqQ6-670enYsuu0uf35AzYzkFJOvSt0Gx1YVU`
      );
      if (res.ok) {
        const data = await res.json();
        return data.results;
      }
      throw new Error("Something unexpected happened");
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred");
    }
  }