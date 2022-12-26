import { Writer } from 'protobufjs/minimal';
import { Any } from 'cosmjs-types/google/protobuf/any';

const AllowedContractAllowance = {
  encode: (message, writer = Writer.create()) => {
    if (message.allowance !== undefined) {
      Any.encode(message.allowance, writer.uint32(10).fork()).ldelim();
    }

    for (const v of message.allowedAddress) {
      writer.uint32(18).string(v);
    }

    return writer;
  },
};

export default AllowedContractAllowance;
