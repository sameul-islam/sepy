import type { PipelineStage } from "mongoose";

import Product from "../models/Product.js";

const SEARCH_INDEX = "sepy_product_search_v1";
const SUGGESTION_LIMIT = 6;

// Primary: direct product matching.

export type ProductSearchTier = "primary" | "secondary";

export const buildProductSearchStage = (
  query: string,
  tier: ProductSearchTier,
) => {
  const primaryFields = [
    {
      autocomplete: {
        query,
        path: "name",
        score: { boost: { value: 8 } },
      },
    },
    {
      autocomplete: {
        query,
        path: "search.categoryName",
        score: { boost: { value: 4 } },
      },
    },
    {
      autocomplete: {
        query,
        path: "details.activity",
        score: { boost: { value: 3 } },
      },
    },
    {
      autocomplete: {
        query,
        path: "search.colors",
        score: { boost: { value: 2 } },
      },
    },
  ];

  const secondaryFields = [
    {
      autocomplete: {
        query,
        path: "highlights",
        score: { boost: { value: 1 } },
      },
    },
    {
      text: {
        query,
        path: "description",
        score: { boost: { value: 0.5 } },
      },
    },
  ];

  return {
    $search: {
      index: SEARCH_INDEX,
      compound: {
        should: tier === "primary" ? primaryFields : secondaryFields,
        minimumShouldMatch: 1,
      },
    },
  };
};

// Secondary: broader matching when primary matching returns no results.
export const buildProductSearchFallbackStage = (query: string) => ({
  $search: {
    index: SEARCH_INDEX,
    compound: {
      should: [
        {
          autocomplete: {
            query,
            path: "highlights",
            score: { boost: { value: 1 } },
          },
        },
        {
          text: {
            query,
            path: "description",
            score: { boost: { value: 0.5 } },
          },
        },
      ],
      minimumShouldMatch: 1,
    },
  },
});

const getSuggestionsBySearchStage = async (searchStage: object) => {
  const pipeline = [
    searchStage,

    {
      $match: {
        status: "active",
      },
    },

    {
      $lookup: {
        from: "variants",
        let: {
          productId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$product", "$$productId"],
              },
              isActive: true,
            },
          },
          {
            $sort: {
              price: 1,
              _id: 1,
            },
          },
          {
            $limit: 1,
          },
          {
            $project: {
              price: 1,
              compareAtPrice: 1,
            },
          },
        ],
        as: "suggestionVariant",
      },
    },

    {
      $match: {
        "suggestionVariant.0": {
          $exists: true,
        },
      },
    },

    {
      $lookup: {
        from: "categories",
        localField: "category",
        foreignField: "_id",
        as: "categoryDetails",
      },
    },

    {
      $unwind: "$categoryDetails",
    },

    {
      $match: {
        "categoryDetails.isActive": true,
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,

        image: {
          $arrayElemAt: ["$images", 0],
        },

        price: {
          $arrayElemAt: ["$suggestionVariant.price", 0],
        },

        compareAtPrice: {
          $arrayElemAt: ["$suggestionVariant.compareAtPrice", 0],
        },

        category: {
          name: "$categoryDetails.name",
          slug: "$categoryDetails.slug",
        },

        score: {
          $meta: "searchScore",
        },
      },
    },

    {
      $sort: {
        score: -1,
        _id: 1,
      },
    },

    {
      $limit: SUGGESTION_LIMIT,
    },
  ];

  return Product.aggregate(pipeline as unknown as PipelineStage[]);
};


export const getProductSearchSuggestions = async (query: string) => {
  const normalizedQuery = query.trim();

  const executeSuggestions = async (
    tier: ProductSearchTier,
  ) => {
    const pipeline = [
      buildProductSearchStage(normalizedQuery, tier),

      {
        $match: {
          status: "active",
        },
      },

      {
        $lookup: {
          from: "variants",
          let: {
            productId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $eq: ["$product", "$$productId"],
                },
                isActive: true,
              },
            },
            {
              $sort: {
                price: 1,
                _id: 1,
              },
            },
            {
              $limit: 1,
            },
            {
              $project: {
                price: 1,
                compareAtPrice: 1,
              },
            },
          ],
          as: "suggestionVariant",
        },
      },

      {
        $match: {
          "suggestionVariant.0": {
            $exists: true,
          },
        },
      },

      {
        $lookup: {
          from: "categories",
          localField: "category",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },

      {
        $unwind: "$categoryDetails",
      },

      {
        $match: {
          "categoryDetails.isActive": true,
        },
      },

      {
        $project: {
          _id: 1,
          name: 1,
          slug: 1,

          image: {
            $arrayElemAt: ["$images", 0],
          },

          price: {
            $arrayElemAt: ["$suggestionVariant.price", 0],
          },

          compareAtPrice: {
            $arrayElemAt: ["$suggestionVariant.compareAtPrice", 0],
          },

          category: {
            name: "$categoryDetails.name",
            slug: "$categoryDetails.slug",
          },

          score: {
            $meta: "searchScore",
          },
        },
      },

      {
        $sort: {
          score: -1,
          _id: 1,
        },
      },

      {
        $limit: SUGGESTION_LIMIT,
      },
    ];

    return Product.aggregate(
      pipeline as unknown as PipelineStage[],
    );
  };

  let suggestions = await executeSuggestions("primary");

  if (suggestions.length === 0) {
    suggestions = await executeSuggestions("secondary");
  }

  return {
    suggestions,
  };
};

