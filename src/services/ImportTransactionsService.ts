import path from 'path';

import { getRepository, In, getCustomRepository } from 'typeorm';
import uploadConfig from '../config/upload';
import Transaction from '../models/Transaction';
import loadCSV from '../helpers/import';
import Category from '../models/Category';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  csvFilename: string;
}

interface CsvTransaction {
  title: string;
  type: 'income' | 'outcome';
  value: number;
  category: string;
}

class ImportTransactionsService {
  public async execute({ csvFilename }: Request): Promise<Transaction[]> {
    const csvFilePath = path.join(uploadConfig.directory, csvFilename);
    const { transactions, categories } = await loadCSV(csvFilePath);
    const categoryRepository = getRepository(Category);

    // search for existing categories
    const existentCategories = await categoryRepository.find({
      where: { title: In(categories) },
    });
    // extract title from  existing categories
    const existentCategoriesTitles = existentCategories.map(
      category => category.title,
    );
    // generate array of categories that do not exist in db
    const notExistentCategoriesTitles = categories
      .filter(category => !existentCategoriesTitles.includes(category))
      .filter((value, index, self) => self.indexOf(value) === index);
    // create new categories objects
    const newCategories = categoryRepository.create(
      notExistentCategoriesTitles.map(title => ({
        title,
      })),
    );
    // persist new categories
    await categoryRepository.save(newCategories);

    // creates array with all categories present in the imported file
    const allCategories = [...existentCategories, ...newCategories];

    // begin strategy for persistence of transactions
    const transactionRepository = getCustomRepository(TransactionsRepository);
    const createdTransactions = transactionRepository.create(
      transactions.map(transaction => ({
        title: transaction.title,
        type: transaction.type,
        value: transaction.value,
        category: allCategories.find(
          category => category.title === transaction.category,
        ),
      })),
    );
    await transactionRepository.save(createdTransactions);

    return createdTransactions;
  }
}

export default ImportTransactionsService;
