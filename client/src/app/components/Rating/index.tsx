import { Star } from "lucide-react";
import React from "react";

type RatingProps = {
  rating: number | null;
};

const Rating = ({ rating }: RatingProps) => {
  const displayRating = rating ?? 0;

  return [1, 2, 3, 4, 5].map((index) => (
    <Star
      key={index}
      color={index <= displayRating ? "#FFC107" : "#E4E5E9"}
      className="w-4 h-4"
    />
  ));
};

export default Rating;