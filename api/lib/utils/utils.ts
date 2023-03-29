type ResourceType = {
  id: string;
  type: 'deal' | 'organization' | 'contact';
};

type ResourceTypes = {
  organization_id?: string;
  deal_id?: string;
  contact_id?: string;
};

export const getResourceTypeWithId = ({
  organization_id,
  deal_id,
  contact_id,
}: ResourceTypes): ResourceType => {
  if (deal_id) {
    return { type: 'deal', id: deal_id };
  } else if (organization_id) {
    return { type: 'organization', id: organization_id };
  } else if (contact_id) {
    return { type: 'contact', id: contact_id };
  } else {
    throw new Error('invalid resource type');
  }
};

export const sortByValue = (jsObj: any) => {
  const sortedArray = [];
  for (const i in jsObj) {
    // Push each JSON Object entry in array by [value, key]
    sortedArray.push([Number(jsObj[i].toFixed(2)), i]);
  }
  // return sortedArray.sort();
  return sortedArray.sort((a: any, b: any) => {
    return b[0] - a[0];
  });
};

export const removeDuplicate = (arr: any[]) => {
  return [...new Set(arr)];
};
