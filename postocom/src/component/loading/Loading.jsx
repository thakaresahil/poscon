import React from "react";

function Loading() {
  return (
    <div role="status" class="container mx-auto max-w-sm animate-pulse">
      <div class="h-2.5 bg-gray-200 rounded-full dark:bg-gray-500 w-48 mb-4"></div>
      <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[360px] mb-2.5"></div>
      <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-500 mb-2.5"></div>
      <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[330px] mb-2.5"></div>
      <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[300px] mb-2.5"></div>
      <div class="h-2 bg-gray-200 rounded-full dark:bg-gray-500 max-w-[360px]"></div>
      <span class="sr-only">Loading...</span>
    </div>
  );
}

export default Loading;
