import { Volume2 } from "lucide-react";
import { Slider } from "./slider";

export function VolumeSlider({ defaultValue, max, onChange }: { defaultValue: number; max: number; onChange: (value: number) => void }) {
    return (
        <div className="flex items-center space-x-2 bg-gray-800 rounded-full p-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <Slider
                defaultValue={[defaultValue]}
                onValueChange={(newValue) => onChange(newValue[0])}
                max={max}
                step={max / 50}
                className="w-32"
            />
        </div>
    )
}