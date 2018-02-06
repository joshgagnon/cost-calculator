from __future__ import print_function
import os
import json
import xml.etree.ElementTree as ET
import pprint
import re


path = os.path.dirname(__file__)

def get_source():
    with open(os.path.join(path, '../source.json'), 'r') as source:
        return json.loads(source.read())


def to_float(input):
    try:
        return float(input.replace(',', ''))
    except ValueError:
        return None

numbers = re.compile('\d+(?:\.\d+)?')
def strip_alpha(input):
    return numbers.findall(input.replace(',', ''))[0]


def daily_rates(node, category_parse=lambda x: x):
    table = node.find(".//table")
    rows = table.findall('.//tbody/row')
    lines = []
    results = []
    for row in rows:
        cells = row.findall('.//entry')
        lines.append([ET.tostring(cell, 'utf8', 'text') for cell in cells])
    for line in lines:
        try:
            results.append({'category': category_parse(line[0]), 'rate': to_float(strip_alpha(line[2]))})
        except IndexError:
            pass
    return results


def time_allocations(node):
    table = node.find(".//table")
    rows = table.findall('.//tbody/row')
    lines = []
    results = []
    current_category = None
    for row in rows:
        cells = row.findall('.//entry')
        lines.append([ET.tostring(cell, 'utf8', 'text') for cell in cells])
    for line in lines:

        if not line[0] and not line[1]:
            pass
        elif line[1] and not any([line[0]] + line[2:]):
            current_category = []
            results.append({'label': line[1], 'items': current_category})

        elif line[0] and (not any(line[1:]) or ''.join(line[1:]) == "ABC") and len(line) == 5:
            current_category = []
            results.append({'label': line[0], 'items': current_category})

        elif all(line[0:2]) and len(line) == 4:
            if current_category is None:
                current_category = []
                results.append({'label': 'Default', 'items': current_category, 'implicit': True})
            current_category.append({
                                    'costCode': line[0],
                                    'label': line[1],
                                    'explaination': line[3]
                                    })
        elif all(line[0:2] + line[3:]):
            if current_category is None:
                current_category = []
                results.append({'label': 'Default', 'items': current_category, 'implicit': True})
            current_category.append({
                                    'costCode': line[0],
                                    'label': line[1],
                                    'A': to_float(line[3]),
                                    'B': to_float(line[4]),
                                    'C': to_float(line[5]),
                                    })
    return results

def high_court_disbursements(table):
    rows = table.findall('.//tbody/row')
    parent_map = {}
    for el in table.iter():
        for child in el:
            parent_map[child] = el
    categories = []
    category_cost = None
    stack = []

    def cost(value):
        try:
            return float(value.replace(',', ''))
        except ValueError:
            return value

    for row in rows:
        if not ET.tostring(row, 'utf8', 'text'):
            continue

        cells = row.findall('.//entry')
        if cells[0].attrib.get('morerows'):
            stack = [[]]
            categories.append({'label': ET.tostring(cells[0], 'utf8', 'text'), 'items': stack[0]})

        label_sub_code = None

        if cells[-5].findall('.//label'):
            for label in cells[-5].findall('.//label')[::-1]:
                label_sub_code = ET.tostring(label, 'utf8', 'text')
                # assume only one label per row, extract then remove
                parent_map[label].remove(label)
        code = ET.tostring(cells[-6], 'utf8', 'text')
        # if first for are empty, then its a subsubitem
        if not any(ET.tostring(cell, 'utf8', 'text') for cell in cells[0:4]):
            stack[2].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[-5], 'utf8', 'text'),
                            'code': label_sub_code
                            })
        elif not code and label_sub_code:
            stack = [stack[0], stack[1], []]
            stack[1].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[-5], 'utf8', 'text'),
                            'code': label_sub_code,
                            'items': stack[2]
                            })
        elif code:
            stack = [stack[0], []]
            category_cost = cost(ET.tostring(cells[-1], 'utf8', 'text'))
            stack[0].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[-5], 'utf8', 'text'),
                            'code': code,
                            'items': stack[1]
                            })
    return categories

def district_court_disbursements(table):
    rows = table.findall('.//tbody/row')
    parent_map = {}
    for el in table.iter():
        for child in el:
            parent_map[child] = el
    categories = []
    category_cost = None
    stack = []

    def cost(value):
        try:
            return float(value.replace(',', ''))
        except ValueError:
            return value

    for row in rows:
        if not ET.tostring(row, 'utf8', 'text'):
            continue

        cells = row.findall('.//entry')
        if cells[0].attrib.get('morerows'):
            stack = [[]]
            categories.append({'label': ET.tostring(cells[0], 'utf8', 'text'), 'items': stack[0]})

        label_sub_code = None

        if row.findall('.//label'):
            for label in row.findall('.//label')[::-1]:
                label_sub_code = ET.tostring(label, 'utf8', 'text')
                # assume only one label per row, extract then remove
                parent_map[label].remove(label)

        code = ET.tostring(cells[-4], 'utf8', 'text')
        # if first 4 are empty, then its a subsubitem
        if not any(ET.tostring(cell, 'utf8', 'text') for cell in cells[0:4]) and ET.tostring(cells[-3], 'utf8', 'text'):
            stack[2].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[-3], 'utf8', 'text'),
                            'code': label_sub_code
                            })
        elif not code and label_sub_code:
            stack = [stack[0], stack[1], []]
            stack[1].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[-3], 'utf8', 'text'),
                            'code': label_sub_code,
                            'items': stack[2]
                            })
        elif code:
            stack = [stack[0], []]
            category_cost = cost(ET.tostring(cells[-1], 'utf8', 'text'))
            stack[0].append({
                            'amount': cost(ET.tostring(cells[-1], 'utf8', 'text')) or category_cost,
                            'label': ET.tostring(cells[-3], 'utf8', 'text'),
                            'code': code,
                            'items': stack[1]
                            })
    return categories

def parse_high_court():
    rules_tree = ET.parse(os.path.join(path, '../src/xml/High Court Rules.xml'))
    rules_root = rules_tree.getroot()

    fees_tree = ET.parse(os.path.join(path, '../src/xml/High Court Fees Regulations.xml'))
    fees_root = fees_tree.getroot()

    rate_id = "DLM6953317"
    rate_node = rules_root.findall(".//*[@id='%s']" % rate_id)[0]

    disbursements_id = "DLM5196182"
    disbursements_table = fees_root.findall(".//*[@id='%s']" % disbursements_id)[0]

    costs_id = "DLM6953320"
    costs_node = rules_root.findall(".//*[@id='%s']" % costs_id)[0]

    return {
        'costs': time_allocations(costs_node),
        'disbursements': high_court_disbursements(disbursements_table),
        'rates': daily_rates(rate_node)
    }



def parse_district_court():
    rules_tree = ET.parse(os.path.join(path, '../src/xml/District Court Rules.xml'))
    rules_root = rules_tree.getroot()

    rate_id = "DLM6122259"
    rate_node = rules_root.findall(".//*[@id='%s']" % rate_id)[0]

    costs_id = "DLM6122255"
    cost_node = rules_root.findall(".//*[@id='%s']" % costs_id)[0]

    fees_tree = ET.parse(os.path.join(path, '../src/xml/District Court Fees Regulations.xml'))
    fees_root = fees_tree.getroot()

    disbursements_id = "DLM5455655"
    disbursements_table = fees_root.findall(".//*[@id='%s']" % disbursements_id)[0]

    return {
        'rates': daily_rates(rate_node, strip_alpha),
        'costs': time_allocations(cost_node),
        'disbursements': district_court_disbursements(disbursements_table)

    }

def save_result(data, filename):
    with open(os.path.join(path, '../src/js/data/%s.json' % filename), 'wb') as out:
        out.write(json.dumps(data))

if __name__ == '__main__':
    save_result(parse_high_court(), 'High Court')
    save_result(parse_district_court(), 'District Court')
    print('Everything parsed')



