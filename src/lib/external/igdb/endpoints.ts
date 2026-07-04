import { fetchAPI } from "@/lib/external/igdb/igdb-api";
import type { RawCompany } from "@/lib/external/igdb/types";

export async function fetchCompanyById(id: number): Promise<RawCompany | null> {
	const companies = await fetchAPI<RawCompany[]>(
		"companies",
		`fields slug, start_date, logo, name, description, developed, published;
        where id = ${id};
        limit 1;
        `,
	);

	return companies[0] || null;
}
