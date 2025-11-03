import { Search, Filter, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import Button from "./ui/Button";

export default function Topbar() {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between bg-secondary p-5 rounded-none shadow-sm mb-8 mt-0 gap-4">
      <div className="flex flex-col items-start">
        <h1 className="font-robotoCondensed text-3xl text-primary font-semibold">
          Products
        </h1>
        <p>
          <Link
            to="/"
            className="relative text-sm font-quicksand group text-[#1f2e40]"
          >
            Home
            <span className="absolute left-0 bottom-0 h-[1px] w-0 bg-black transition-all duration-500 group-hover:w-full" />
          </Link>{" "}
          /{" "}
          <span className="text-sm font-quicksand text-primary">Products</span>
        </p>
      </div>

      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-full w-full sm:w-80 shadow-inner">
        <Search className="text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Search Product"
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <button className="flex items-center gap-1 bg-white px-3 py-2 rounded-full shadow-sm font-quicksand text-sm text-[#1f2e40] hover:bg-primary hover:text-white transition-all">
          <Filter size={16} />
          <span>Filter</span>
        </button>

        <button className="flex items-center gap-1 bg-white px-3 py-2 rounded-full shadow-sm font-quicksand text-sm text-[#1f2e40] hover:bg-primary hover:text-white transition-all">
          <span>Sort by</span>
          <ChevronDown size={16} />
        </button>

        <Button className="bg-background">+ Add Product</Button>
      </div>
    </div>
  );
}
