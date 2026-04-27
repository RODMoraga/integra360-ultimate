import { userRepository } from "./user.repository";

class UserService {
  listUsers(companyId: bigint) {
    return userRepository.list(companyId);
  }
}

export const userService = new UserService();