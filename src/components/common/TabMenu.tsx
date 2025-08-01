interface TabMenuItem {
  key: string;
  label: string;
}

interface TabMenuProps {
  items: TabMenuItem[];
  activeTab: string;
  onTabChange: (key: string) => void;
}

export default function TabMenu({ items, activeTab, onTabChange }: TabMenuProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="flex">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onTabChange(item.key)}
            className={`flex-1 py-4 text-center font-medium transition-colors ${
              activeTab === item.key 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}