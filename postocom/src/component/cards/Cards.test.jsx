import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Cards from "./Cards";

const renderCard = (props) =>
  render(
    <MemoryRouter>
      <Cards id={3} img="shirt.png" orgprice={2000} sellprice={1500} name="Linen Shirt" {...props} />
    </MemoryRouter>
  );

test("links to the product page and shows the discount", () => {
  renderCard();
  expect(screen.getByRole("link")).toHaveAttribute("href", "/product/3");
  expect(screen.getByText("At ₹1500")).toBeInTheDocument();
  expect(screen.getByText("(25% OFF)")).toBeInTheDocument();
});

test("shortens long product names", () => {
  renderCard({ name: "A".repeat(60) });
  expect(screen.getByText(`${"A".repeat(48)}...`)).toBeInTheDocument();
});
