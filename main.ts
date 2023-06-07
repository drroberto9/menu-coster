import {
  GetProductsForIngredient,
  GetRecipes,
} from "./supporting-files/data-access";
import {
  NutrientFact,
  Product,
  UnitOfMeasure,
} from "./supporting-files/models";
import {
  GetCostPerBaseUnit,
  SumUnitsOfMeasure,
  GetNutrientFactInBaseUnits,
} from "./supporting-files/helpers";
import { RunTest, ExpectedRecipeSummary } from "./supporting-files/testing";

console.clear();
console.log("Expected Result Is:", ExpectedRecipeSummary);

const recipeData = GetRecipes(); // the list of 1 recipe you should calculate the information for

let recipeSummary: any = {}; // the final result to pass into the test function

/*
 * YOUR CODE GOES BELOW THIS, DO NOT MODIFY ABOVE
 * (You can add more imports if needed)
 * */

const selectedProducts: any = []; // the selected product based on the cheapest cost0
let cheapestCost: number = 0; // holds the cheapest total cost

/*
   this loops the items or ingredients in order to get the cheapest product and to compute the cheapest total cost
 */
recipeData[0].lineItems.forEach((item) => {
  const productsForIngredient = GetProductsForIngredient(item.ingredient);

  /*
    The succeding block of statements will create a new object that has the product name and it's cost, the purpose is easly sort them from cheapest to expensive.
    The top of the object will now then be considered as the cheapest product. 
   */
  const productPerSupplier: any = [];

  // this is where we create/push new product object
  productsForIngredient.forEach((product) => {
    product.supplierProducts.forEach((supplierProduct) => {
      productPerSupplier.push({
        productName: product.productName,
        costPerUnit: GetCostPerBaseUnit(supplierProduct),
      });
    });
  });

  // this will sort the new product object, from cheapest to expensive
  const cheapestProduct = productPerSupplier.sort((a: any, b: any) => {
    return a.costPerUnit - b.costPerUnit;
  });

  // this will push the top element to select products
  selectedProducts.push(
    productsForIngredient.find(
      (product) => product.productName === cheapestProduct[0].productName
    )
  );

  // this will compute the cheapest cost of the recipe
  cheapestCost += cheapestProduct[0].costPerUnit * item.unitOfMeasure.uomAmount;
});

/*
    This function will return the nutrient facts for each nutrients, with the following flow:
    1. Get the products with the given nutrients
    2. Loop if there are multiple products that has the given nutrients in order to sum all of them
    3. create new object of nutrient facts in case if there are multiple products that has the given nutrients
    4. return the nutrition facts by calling the function GetNutrientFactInBaseUnits in order to follow the base units
*/
const getNutrientAtCheapestCost = (nutrientName: string) => {
  // this will map out the products thats has a particular nutrients to it
  const productWithNutrients = selectedProducts
    .flatMap((selectedProduct: Product) => {
      return selectedProduct.nutrientFacts.find(
        (nutrient: any) => nutrient.nutrientName === nutrientName
      );
    })
    .filter((selectedProduct: Product) => selectedProduct);

  let finalNutrientAmount: UnitOfMeasure =
    productWithNutrients[0].quantityAmount; // I initial set the final nutrients to the top products with nutrients

  // this will add the nutrients of the multiple products with given nutrients
  if (productWithNutrients.length > 1) {
    for (let x = 1; x < productWithNutrients.length; x++) {
      finalNutrientAmount = SumUnitsOfMeasure(
        finalNutrientAmount,
        productWithNutrients[x].quantityAmount
      );
    }
  }

  const nutrientFacts: NutrientFact = {
    nutrientName: productWithNutrients[0].nutrientName,
    quantityAmount: finalNutrientAmount,
    quantityPer: productWithNutrients[0].quantityPer,
  };

  return GetNutrientFactInBaseUnits(nutrientFacts);
};

// creating the new recipe summary
recipeSummary = {
  "Creme Brulee": {
    cheapestCost,
    nutrientsAtCheapestCost: {
      Carbohydrates: getNutrientAtCheapestCost("Carbohydrates"),
      Fat: getNutrientAtCheapestCost("Fat"),
      Protein: getNutrientAtCheapestCost("Protein"),
      Sodium: getNutrientAtCheapestCost("Sodium"),
    },
  },
};

/*
 * YOUR CODE ABOVE THIS, DO NOT MODIFY BELOW
 * */
RunTest(recipeSummary);
