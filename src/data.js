export function transformData(rows) {
    if (!rows || rows.length <= 1) return [];
    
    return rows.slice(1)
        .filter(row => row[0]) // Filter out empty rows where the first cell is missing
        .map(row => ({
            name: row[0] ?? "",
            photo: row[1] ?? "",
            age: Number(row[2]),
            country: row[3] ?? "",
            interest: row[4] ?? "",
            netWorth: Number(String(row[5] ?? '').replace(/[$,]/g, ''))
        }));
}