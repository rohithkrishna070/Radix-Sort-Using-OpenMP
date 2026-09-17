export function radixSortWithSteps(inputArr) {
  if (inputArr.length <= 1) {
    return { steps: [], sortedArray: [...inputArr] };
  }

  const arr = [...inputArr];
  const max = Math.max(...arr);
  const steps = [];
  
  let pass = 0;
  for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
    const buckets = Array.from({ length: 10 }, () => []);
    const arrayBefore = [...arr];
    
    // Distribute into buckets
    for (let i = 0; i < arr.length; i++) {
      const digit = Math.floor(arr[i] / exp) % 10;
      buckets[digit].push(arr[i]);
    }
    
    // Collect from buckets
    let index = 0;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < buckets[i].length; j++) {
        arr[index++] = buckets[i][j];
      }
    }
    
    let digitName;
    if (exp === 1) digitName = 'Units';
    else if (exp === 10) digitName = 'Tens';
    else if (exp === 100) digitName = 'Hundreds';
    else if (exp === 1000) digitName = 'Thousands';
    else digitName = `10^${Math.log10(exp)}`;
    
    steps.push({
      pass,
      digitName,
      digitPosition: Math.log10(exp) + 1,
      arrayBefore,
      buckets: buckets.map(b => [...b]),
      arrayAfter: [...arr]
    });
    
    pass++;
  }
  
  return { steps, sortedArray: arr };
}

export function radixSort(arr) {
  if (arr.length <= 1) return arr;
  const max = Math.max(...arr);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < arr.length; i++) {
      buckets[Math.floor(arr[i] / exp) % 10].push(arr[i]);
    }
    let idx = 0;
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < buckets[i].length; j++) {
        arr[idx++] = buckets[i][j];
      }
    }
    exp *= 10;
  }
  return arr;
}
