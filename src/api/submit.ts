import { SeatMapJsonFormat } from "@/types/export.type";


const API_URL = "http://localhost:8080";

export async function submitSeatmapToServer(seatmap: SeatMapJsonFormat) {
    const requestUrl = `${API_URL}/seatmap`;


    const serialized = JSON.stringify(seatmap, null, 4);

    const submitRes = await fetch(requestUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: serialized,
    });

    // on error
    if (false === submitRes.ok) {
        const errorData = await submitRes.json();
        alert(errorData);
        return;
    }

    // on success
    console.log(await submitRes.headers.get("Location"));
    // submitRes.headers.forEach(o => console.log(o));
}