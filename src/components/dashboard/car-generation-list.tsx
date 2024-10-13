"use client";
import { getAllCarGenerationsAction } from "@lib/actions/carGenerationsActions";
import useCarGenerations from "@lib/queries/useCarGenerations";
import React, { useCallback, useState } from "react";
import GenerationItem from "./generation-item";
import { CarGenerationProps } from "@lib/types";
import { Button } from "@components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";
import Spinner from "@components/Spinner";

const CarGenerationList = () => {
  const [page, setPage] = useState(1);

  const { isLoading, data, pageCount, error } = useCarGenerations(page);

  const carGenerationData: CarGenerationProps[] =
    data?.carGenerationsData || [];

  const handleResetPage = useCallback(() => {
    if (carGenerationData.length === 1) {
      setPage((page) => page - 1);
    }
  }, [carGenerationData.length, setPage]);

  if (error) return <p>{String(error)}</p>;
  if (isLoading) return <Spinner className=" h-[300px]" size={25} />;

  if (!carGenerationData.length)
    return <p>No car generation data has been posted yet!</p>;

  return (
    <div className="mt-10 ">
      <h3 className=" tracking-wider font-semibold text-2xl">
        CAR GENERATIONS
      </h3>
      <ul className=" flex flex-wrap gap-2 p-4 max-h-[45vh] overflow-y-auto  ">
        {carGenerationData.map((item) => (
          <GenerationItem
            key={item.id}
            handleResetPage={handleResetPage}
            item={item}
          />
        ))}
      </ul>

      <div className=" flex  my-4 justify-end gap-3">
        <Button
          onClick={() => {
            if (isLoading || page === 1) return;
            setPage((page) => page - 1);
          }}
          size="icon"
          variant="secondary"
          disabled={isLoading || page === 1}
        >
          <MoveLeft size={12} />
        </Button>
        <Button
          onClick={() => {
            if (isLoading || page === pageCount) return;

            setPage((page) => page + 1);
          }}
          variant="secondary"
          size="icon"
          disabled={isLoading || page === pageCount}
        >
          <MoveRight size={12} />
        </Button>
      </div>
    </div>
  );
};

export default CarGenerationList;
