import { Search } from "lucide-react";
import { Input } from "./input";

function SearchInput({ onInput }: { onInput: (value: string) => void }) {
    return (<div className="p-4 border-b border-gray-700">
        <div className="relative">
            <Input
                type="text"
                placeholder="Search contacts"
                className="pl-10 bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400"
                onChange={(e => onInput(e.target.value.trim()))}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        </div>
    </div>);
}

export default SearchInput;
