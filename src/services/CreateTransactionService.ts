// import AppError from '../errors/AppError';
import { getCustomRepository } from 'typeorm';
import CreateCategoryService from './CreateCategoryService';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    if (type === 'outcome') {
      const balance = transactionsRepository.getBalance();
      if ((await balance).total < value) {
        throw new AppError('current account balance is insufficient.', 400);
      }
    }
    const createCategory = new CreateCategoryService();
    const categoryReturned = await createCategory.execute({ title: category });
    const category_id = categoryReturned.id;
    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });
    await transactionsRepository.save(transaction);
    return transaction;
  }
}

export default CreateTransactionService;
