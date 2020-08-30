// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import CreateCategoryService from './CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository'
import Transaction from '../models/Transaction';

interface Request {
  title: string;
  value: number;
  type: 'income'|'outcome';
  category:string;

}

class CreateTransactionService {
  public async execute({title, value, type, category}:Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createCategory = new CreateCategoryService();
    const categoryReturned = await createCategory.execute({title:category});
    const category_id = categoryReturned.id;
    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
