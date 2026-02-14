from sqlalchemy import String,cast

class UtilService:
    def handle_filter(self, filterBy, ObjectType):
        condition = []
        filter_data = filterBy.model_dump(exclude_unset=True)
        for key, value in filter_data.items():
            if column is None:
                continue
            if key.startswith("min_"):
                condition.append(column >= value)
            elif key.startswith("max_"):
                condition.append(column <= value)
            elif isinstance(value,str):
                condition.append(column.ilike(f"%{value}"))
            else:
                column = getattr(ObjectType, key)
            condition.append(column == value)
        return condition
