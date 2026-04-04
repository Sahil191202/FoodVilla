import MenuCard from "./MenuCard.jsx";

const MenuCategory = ({ category, items }) => {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="font-semibold text-gray-900">{category}</h3>
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400">{items.length} items</span>
      </div>
      <div className="space-y-2">
        {items.map((item) => (
          <MenuCard key={item._id} item={item} />
        ))}
      </div>
    </div>
  );
};

export default MenuCategory;