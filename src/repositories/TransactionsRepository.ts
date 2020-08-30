import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();
    const income = transactions.reduce((acc:number, curr:Transaction)=>(curr.type==='income')? acc + curr.value: acc,0);
    const outcome = transactions.reduce((acc:number, curr:Transaction)=>(curr.type==='outcome')? acc + curr.value: acc,0);
    const total = income - outcome;
    return {income, outcome, total};
  }
}

export default TransactionsRepository;

