import csvParse from 'csv-parse';
import fs from 'fs';

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}
interface Response {
  categories: string[];
  transactions: CsvTransaction[];
}

export default async function loadCSV(filePath: string): Promise<Response> {
  // open file stream
  const readCSVStream = fs.createReadStream(filePath);

  // config read of file
  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  // add pipe for listen stream
  const parseCSV = readCSVStream.pipe(parseStream);

  const transactions = [] as CsvTransaction[];
  const categories = [] as string[];

  // validate and push transformed objects to array(transactions and categories)
  parseCSV.on('data', async ([title, type, value, category]) => {
    if (!title || !type || !value || !category) return;
    transactions.push({ title, type, value, category });
    categories.push(category);
  });

  // terminate process when at the eof
  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  // remove temporary file
  await fs.promises.unlink(filePath);

  return { transactions, categories };
}
