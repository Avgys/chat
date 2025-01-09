import { container } from "@/dependencyInjection/inversify.config";
import { interfaces } from "inversify";
import { useState } from "react";

export function useService<T>(serviceName: interfaces.ServiceIdentifier<T>): T {
    const [service, setservice] = useState<T>(() => container.get<T>(serviceName));
    return service;
}