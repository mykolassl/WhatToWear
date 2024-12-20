import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { WeatherData } from "./useWeather";
import { Preferences } from "./useRecommendation";

export type History = {
    id: number;
    prompt: string;
    response: string;
    rating: number | null;
    created_at: string;
};

export type ClothingRecommendation = {
    summary: string;
    clothes: {
        hat: string;
        top: string;
        bottom: string;
        shoes: string;
    };
    items: [];
    explanation: string;
};

async function saveHistory(data: { prompt: any; response: any }) {
    await fetch(import.meta.env.VITE_BASE_API_URL + "/api/save-history", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        mode: "cors",
        body: JSON.stringify(data),
    });
}

async function getHisotry() {
    const response = await fetch(
        import.meta.env.VITE_BASE_API_URL + "/api/history",
        {
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            mode: "cors",
        }
    );

    return (await response.json()) as History[];
}

export function useSaveHistory() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: saveHistory,
        onSuccess() {
            queryClient.invalidateQueries({
                queryKey: ["history"],
            });
        },
    });
}

export function useHistory() {
    return useQuery({
        queryKey: ["history"],
        queryFn: getHisotry,
        staleTime: Infinity,
        select(data) {
            return data.map((d, idx) => {
                console.log(idx, d);
                return {
                    ...d,
                    prompt: JSON.parse(d.prompt) as {
                        weatherData: WeatherData;
                        userPreferences: Preferences;
                    },
                    response: JSON.parse(d.response) as
                        | {
                              clothingRecommendation: ClothingRecommendation;
                              imageUrl: string;
                          }
                        | ClothingRecommendation,
                };
            });
        },
    });
}
