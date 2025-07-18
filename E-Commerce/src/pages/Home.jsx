import React, { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import axiosInstance from "../api/axiosInstance";

const Home = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const getProducts = async () => {
      try {
        const res = await axiosInstance.get("/products");
        console.log("Fetched products:", res.data);
        setProducts(res.data.products || []);
      } catch (error) {
        console.error("Error fetching products:", error);
        setProducts([]);
      }
    };

    getProducts();
  }, []);

  return <ProductGrid products={products} />;
};

const ProductGrid = ({ products }) => {
  const cardsRef = useRef([]);

  useEffect(() => {
    const validCards = cardsRef.current.filter(Boolean);

    if (products?.length > 0 && validCards.length > 0) {
      gsap.fromTo(
        validCards,
        { y: 50, opacity: 0 }, // 👈 from state
        {
          y: 0,
          opacity: 2,
          stagger: {
            amount: 0.6,
            from: "start",
          },
          duration: 1,
          ease: "expo.out",
          overwrite: "auto",
        }
      );
    }
  }, [products]);

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1674027392887-751d6396b710?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fG9ubGluZSUyMHNob3BwaW5nfGVufDB8fDB8fHww')",
      }}
    >
      <div className="min-h-screen bg-white/20 backdrop-blur-sm p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {products.map((eachProduct, i) => (
            <div
              key={i}
              ref={(el) => (cardsRef.current[i] = el)}
              className="bg-white rounded-xl shadow-lg p-4 flex flex-col hover:shadow-xl transition duration-300"
            >
              <div className="w-full h-48 overflow-hidden rounded-md mb-3 flex items-center justify-center bg-gray-50">
                <img
                  src={eachProduct.product_image}
                  alt={eachProduct.product_name}
                  className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
                />
              </div>
              <h2 className="text-lg font-semibold text-gray-800 mb-1">
                {eachProduct.product_name}
              </h2>
              <p className="text-blue-600 font-semibold mb-1">
                Rs. {eachProduct.price}
              </p>
              <p className="text-gray-600 text-sm">{eachProduct.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Home;
