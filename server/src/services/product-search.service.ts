import type { PipelineStage } from "mongoose";

import Product from "../models/Product.js";

const SEARCH_INDEX = "sepy_product_search_v1";
const SUGGESTION_LIMIT = 6;

export const getProductSearchSuggestions = async (query: string) => {
  const normalizedQuery = query.trim();

  const pipeline = [
    {
      $search: {
        index: SEARCH_INDEX,

        compound: {
          should: [
            {
              autocomplete: {
                query: normalizedQuery,
                path: "name",
                score: {
                  boost: {
                    value: 8,
                  },
                },
              },
            },
            {
              autocomplete: {
                query: normalizedQuery,
                path: "search.categoryName",
                score: {
                  boost: {
                    value: 4,
                  },
                },
              },
            },
            {
              autocomplete: {
                query: normalizedQuery,
                path: "details.activity",
                score: {
                  boost: {
                    value: 3,
                  },
                },
              },
            },
            {
              autocomplete: {
                query: normalizedQuery,
                path: "search.colors",
                score: {
                  boost: {
                    value: 2,
                  },
                },
              },
            },
            {
              autocomplete: {
                query: normalizedQuery,
                path: "highlights",
                score: {
                  boost: {
                    value: 1,
                  },
                },
              },
            },
            {
              text: {
                query: normalizedQuery,
                path: "description",
                score: {
                  boost: {
                    value: 0.5,
                  },
                },
              },
            },
          ],

          minimumShouldMatch: 1,
        },
      },
    },

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

  const suggestions = await Product.aggregate(
    pipeline as unknown as PipelineStage[],
  );

  return {
    suggestions,
  };
};
