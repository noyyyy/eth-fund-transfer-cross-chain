import Joi from "joi";

export interface ICreateTransferTaskDto {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  amount: string;
}

export const createTransferTaskSchema = Joi.object({
  fromChainId: Joi.number().required(),
  toChainId: Joi.number().required(),
  fromTokenAddress: Joi.string().required(),
  amount: Joi.string().required(),
});
