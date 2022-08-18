import { useState } from "react";

type Props = {
  type: string;
  selected: number | string | null;
  onSelected: (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    number: number | string
  ) => void;
};

const initialCards = [0, 0.5, 1, 3, 5, 8, 13, 20, 40, 100, "∞", "☕️"];

const CardSelection = (props: Props) => {
  const [cards, setCards] = useState(initialCards);

  return (
    <div className="border-4 border-dashed border-gray-200 rounded-lg px-1 py-2">
      <div className="grid grid-cols-4 xs:grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-10">
        {cards.map((number: number | string, i: number) => {
          const currentUserValue = props.selected;
          const borderStyle =
            currentUserValue === number
              ? "border-4 border-orange-200"
              : "border-4 border-gray-200";
          return (
            <div
              key={`cardNumber-${i}`}
              onClick={(e) => props.onSelected(e, number)}
              className={`mr-1 mb-1 cursor-pointer bg-white rounded-lg ${borderStyle} shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700`}>
              <div className="flex flex-col items-center px-auto py-6">
                <span className="text-3xl sm:text-4xl cursor-pointer">
                  {number}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CardSelection;
