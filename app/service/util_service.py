from sqlalchemy import String,cast

class UtilService:
    def handle_filter(self, filterBy, ObjectType):
        conditions = []
        filter_data = filterBy.model_dump(exclude_unset=True)

        for key, value in filter_data.items():
            column_name = key
            operator = "eq" 

            if key.startswith("min_"):
                column_name = key.replace("min_", "") 
                operator = "ge" 
            elif key.startswith("max_"):
                column_name = key.replace("max_", "")
                operator = "le" 

            column = getattr(ObjectType, column_name, None)

            if column is None:
                continue 

            if operator == "ge":
                conditions.append(column >= value)
            elif operator == "le":
                conditions.append(column <= value)
            elif isinstance(value, str):

                conditions.append(column.ilike(f"%{value}%"))
            else:

                conditions.append(column == value)

        return conditions